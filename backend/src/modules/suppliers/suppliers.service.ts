import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. GET /api/suppliers (Lọc xóa mềm, tìm kiếm tên/SĐT, sắp xếp, phân trang)
  async findAll(query: SupplierQueryDto) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.supplierRepository.createQueryBuilder('supplier');

    // Chỉ lấy nhà cung cấp chưa bị xóa mềm (IsActive = 1)
    queryBuilder.where('supplier.isActive = :isActive', { isActive: true });

    // Tìm kiếm tương đối theo Name hoặc Phone
    if (query.search && query.search.trim() !== '') {
      const searchKeyword = `%${query.search.trim()}%`;
      queryBuilder.andWhere(
        new Brackets((subQuery) => {
          subQuery
            .where('supplier.name LIKE :searchKeyword', { searchKeyword })
            .orWhere('supplier.phone LIKE :searchKeyword', { searchKeyword });
        }),
      );
    }

    // Sắp xếp theo sortBy (mặc định Id hoặc Name) và order (ASC / DESC)
    const allowedSortFields: Record<string, string> = {
      id: 'supplier.id',
      Id: 'supplier.id',
      name: 'supplier.name',
      Name: 'supplier.name',
      createdAt: 'supplier.createdAt',
      CreatedAt: 'supplier.createdAt',
    };

    const sortColumn =
      query.sortBy && allowedSortFields[query.sortBy]
        ? allowedSortFields[query.sortBy]
        : 'supplier.id';

    const sortOrder: 'ASC' | 'DESC' =
      query.order && query.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    queryBuilder.orderBy(sortColumn, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [suppliers, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: suppliers,
      meta: {
        totalItems,
        itemCount: suppliers.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  // 2. GET /api/suppliers/:id (Tìm theo Id và đang hoạt động, không thấy -> 404)
  async findOne(id: number): Promise<Supplier> {
    const existingSupplier = await this.supplierRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!existingSupplier) {
      throw new NotFoundException('Không tìm thấy nhà cung cấp');
    }

    return existingSupplier;
  }

  // 3. POST /api/suppliers (Kiểm tra trùng tên -> 409, hợp lệ -> 201)
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplierName = createSupplierDto.name.trim();

    const duplicateSupplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('LOWER(LTRIM(RTRIM(supplier.name))) = LOWER(:supplierName)', {
        supplierName,
      })
      .getOne();

    if (duplicateSupplier) {
      throw new ConflictException('Tên nhà cung cấp đã tồn tại');
    }

    const newSupplier = this.supplierRepository.create({
      ...createSupplierDto,
      name: supplierName,
      phone: createSupplierDto.phone?.trim(),
      email: createSupplierDto.email?.trim(),
      address: createSupplierDto.address?.trim(),
      isActive: true,
    });

    return await this.supplierRepository.save(newSupplier);
  }

  // 4. PUT /api/suppliers/:id (Kiểm tra tồn tại -> 404, trùng tên khác Id -> 409, cập nhật UpdatedAt)
  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const existingSupplier = await this.findOne(id);

    if (updateSupplierDto.name !== undefined) {
      const updatedSupplierName = updateSupplierDto.name.trim();

      const duplicateSupplier = await this.supplierRepository
        .createQueryBuilder('supplier')
        .where(
          'LOWER(LTRIM(RTRIM(supplier.name))) = LOWER(:updatedSupplierName)',
          { updatedSupplierName },
        )
        .andWhere('supplier.id <> :id', { id })
        .getOne();

      if (duplicateSupplier) {
        throw new ConflictException('Tên nhà cung cấp đã tồn tại');
      }

      existingSupplier.name = updatedSupplierName;
    }

    if (updateSupplierDto.phone !== undefined) {
      existingSupplier.phone = updateSupplierDto.phone.trim();
    }

    if (updateSupplierDto.email !== undefined) {
      existingSupplier.email = updateSupplierDto.email.trim();
    }

    if (updateSupplierDto.address !== undefined) {
      existingSupplier.address = updateSupplierDto.address.trim();
    }

    await this.supplierRepository
      .createQueryBuilder()
      .update(Supplier)
      .set({
        name: existingSupplier.name,
        phone: existingSupplier.phone,
        email: existingSupplier.email,
        address: existingSupplier.address,
        updatedAt: () => 'SYSDATETIME()',
      })
      .where('id = :id', { id })
      .execute();

    return await this.findOne(id);
  }

  // 5. DELETE /api/suppliers/:id (Kiểm tra tồn tại -> 404, có phiếu nhập -> 400, xóa mềm IsActive = 0)
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    const goodsReceiptQueryResult = await this.dataSource.query(
      `SELECT COUNT(1) AS receiptCount FROM GoodsReceipts WHERE SupplierId = @0`,
      [id],
    );

    const goodsReceiptCount = Number(
      goodsReceiptQueryResult?.[0]?.receiptCount ?? 0,
    );

    if (goodsReceiptCount > 0) {
      throw new BadRequestException(
        'Không thể xóa nhà cung cấp đang có phiếu nhập kho',
      );
    }

    await this.supplierRepository
      .createQueryBuilder()
      .update(Supplier)
      .set({
        isActive: false,
        updatedAt: () => 'SYSDATETIME()',
      })
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Xóa nhà cung cấp thành công',
    };
  }
}