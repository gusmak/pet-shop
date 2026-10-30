import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
export declare class ContactService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContactDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
