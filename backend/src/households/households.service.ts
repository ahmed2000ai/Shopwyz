import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { Role } from '@prisma/client';

@Injectable()
export class HouseholdsService {
    constructor(private prisma: PrismaService) { }

    async createHousehold(userId: string, data: CreateHouseholdDto) {
        // 1. Create the household
        // 2. Add the user as OWNER
        // Prisma transaction is safer here to ensure both happen or neither.
        return this.prisma.$transaction(async (tx) => {
            const household = await tx.household.create({
                data: {
                    name: data.name,
                    city: data.city,
                    // Automally add the creator as a member with OWNER role
                    members: {
                        create: {
                            userId: userId,
                            role: Role.OWNER,
                        },
                    },
                },
                include: {
                    members: true,
                },
            });
            return household;
        });
    }

    async listHouseholds(userId: string) {
        return this.prisma.household.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: true, // Optional: if we want to show member count or roles
            },
        });
    }
}
