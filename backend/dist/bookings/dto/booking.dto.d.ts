import { BookingStatus, PetSize, PetSpecies } from '@prisma/client';
export declare class CreateBookingDto {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    petName: string;
    petSpecies: PetSpecies;
    petSize: PetSize;
    services: string[];
    date: string;
    time: string;
    notes?: string;
}
export declare class LookupBookingDto {
    number: string;
    phone: string;
}
export declare class ListBookingsQuery {
    q?: string;
    status?: BookingStatus;
    date?: string;
    page?: number;
    pageSize?: number;
}
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
    reason?: string;
}
