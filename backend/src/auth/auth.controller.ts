import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly prisma: PrismaService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        // Stub implementation: Upsert user based on email
        // In real app, we'd verify password or external token
        const user = await this.prisma.user.upsert({
            where: { email: loginDto.email },
            update: {},
            create: {
                email: loginDto.email,
                name: loginDto.name || 'Anonymous',
                passwordHash: 'stub_hash', // Dummy
            },
        });
        return user;
    }
}
