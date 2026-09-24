import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

@Controller('v1/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100 MB max for videos and high quality images
    }
  }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or file too large');
    }
    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
