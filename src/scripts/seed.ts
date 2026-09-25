import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { PagesService } from '../pages/pages.service';
import { LandsService } from '../lands/lands.service';
import { VideosService } from '../videos/videos.service';
import { User } from '../auth/user.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Seed Pages
  const pagesService = app.get(PagesService);
  const pageExists = await pagesService.findBySlug('home').catch(() => null);
  if (!pageExists) {
    await pagesService.create({
      slug: 'home',
      title: 'Welcome to PGI Realtors Clone',
      htmlContent: `<h1>PGI Realtors Clone</h1><p>This is placeholder content. Replace with real scraped HTML.</p>`,
    });
    console.log('✅ Seeded home page');
  }

  // Seed Lands
  const landsService = app.get(LandsService);
  const lands = await landsService.findAll();
  if (lands.length === 0) {
    const defaultLands = [
      {
        title: 'Prime Residential Plot',
        location: 'Sector 62, Noida',
        price: '₹2.5 Cr',
        size: '450 sq.yds',
        type: 'Residential Land',
        dimensions: '30ft × 45ft',
        facing: 'North-East',
        owner: 'Shree Builders Pvt Ltd',
        images: [
          '/residential3.png',
          '/residential1.png',
          '/residential2.png',
          '/residential4.png',
          '/residential5.png'
        ],
        rating: 4.9,
        amenities: ['Corner Plot', 'Wide Road', 'Water Supply', 'Electricity', 'Drainage'],
        verification: 'Approved',
        measurement: '30ft x 45ft = 1350 sq.ft'
      },
      {
        title: 'Agricultural Land',
        location: 'Devanahalli, Bangalore',
        price: '₹1.8 Cr',
        size: '2 acres',
        type: 'Agricultural Land',
        dimensions: '200ft × 435ft',
        facing: 'East',
        owner: 'Green Valley Farms',
        images: [
          '/agri1.jpg',
          '/agri2.jpg',
          '/agri3.jpg',
          '/agri4.jpg',
          '/agri5.jpg',
          '/agri6.jpg',
          '/agri7.jpg',
          '/agri8.jpg'
        ],
        rating: 4.7,
        amenities: ['Fertile Soil', 'Water Borewell', 'Fencing', 'Farm House'],
        verification: 'Verified',
        measurement: '200ft x 435ft = 87,000 sq.ft'
      },
      {
        title: 'Commercial Land',
        location: 'Sector 62, Noida',
        price: '₹8.5 Cr',
        size: '1200 sq.yds',
        type: 'Commercial Land',
        dimensions: '60ft × 80ft',
        facing: 'West',
        owner: 'Bombay Land Developers',
        images: [
          '/commercial1.jpg',
          '/commercial2.jpg',
          '/commercial3.jpg',
          '/commercial4.jpg'
        ],
        rating: 4.8,
        amenities: ['Prime Location', 'Road Access', 'Parking Space', 'Construction Allowed'],
        verification: 'Approved',
        measurement: '60ft x 80ft = 4,800 sq.ft'
      },
      {
        title: 'Industrial Plot',
        location: 'Okhla Industrial Area, Delhi',
        price: '₹3.2 Cr',
        size: '650 sq.yds',
        type: 'Industrial Land',
        dimensions: '50ft × 52ft',
        facing: 'South',
        owner: 'Industrial Estates Ltd',
        images: [
          '/industrial1.jpg',
          '/industrial2.jpg',
          '/industrial3.jpg'
        ],
        rating: 4.6,
        amenities: ['Power Supply', 'Water Access', 'Loading Bay', 'Security'],
        verification: 'Verified',
        measurement: '50ft x 52ft = 2,600 sq.ft'
      },
      {
        title: 'Waterfront Plot',
        location: 'Alibaug, Mumbai',
        price: '₹4.1 Cr',
        size: '800 sq.yds',
        type: 'Residential Land',
        dimensions: '40ft × 90ft',
        facing: 'East',
        owner: 'Coastal Estates',
        images: [
          'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=600'
        ],
        rating: 4.9,
        amenities: ['Beach Access', 'Scenic View', 'Gated Community', 'Road Access'],
        verification: 'RERA Registered',
        measurement: '40ft x 90ft = 3,600 sq.ft'
      },
      {
        title: 'Hill View Plot',
        location: 'Lonavala, Pune',
        price: '₹95 Lakh',
        size: '1 acre',
        type: 'Farm Land',
        dimensions: '150ft × 290ft',
        facing: 'North',
        owner: 'Sahyadri Farms',
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'
        ],
        rating: 4.5,
        amenities: ['Hill View', 'Fresh Air', 'Farm House', 'Fencing'],
        verification: 'Verified',
        measurement: '150ft x 290ft = 43,560 sq.ft'
      }
    ];

    for (const item of defaultLands) {
      await landsService.create(item);
    }
    console.log(`✅ Seeded ${defaultLands.length} land plots`);
  }

  // Seed Videos
  const videosService = app.get(VideosService);
  const videosList = await videosService.findAll();
  if (videosList.length === 0) {
    const defaultVideos = [
      {
        src: '/videos/residential_video1.mp4',
        title: 'BuildSmart Luxury Residence Design',
        subtitle: '',
        badge: 'HD Animation',
        size: 'large',
        tag: 'Featured'
      },
      {
        src: '/videos/residential_video2.mp4',
        title: 'BuildSmart Premium Villa Development',
        subtitle: '',
        badge: 'HD Animation',
        size: 'large',
        tag: 'Featured'
      },
      {
        src: '/videos/residential_video3.mp4',
        title: 'BuildSmart Modern Apartment Planning',
        subtitle: '',
        badge: 'HD Animation',
        size: 'large',
        tag: 'Featured'
      },
      {
        src: '/videos/residential_video4.mp4',
        title: 'BuildSmart Custom Home Creation',
        subtitle: '',
        badge: 'HD Animation',
        size: 'large',
        tag: 'Featured'
      },
      {
        src: '/videos/agri_video1.mp4',
        title: 'BuildSmart Modern Farm Infrastructure',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/agri_video2.mp4',
        title: 'BuildSmart Greenhouse Development',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/agri_video3.mp4',
        title: 'BuildSmart Agri Processing Facility',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/agri_video4.mp4',
        title: 'BuildSmart Livestock Facility Design',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/agri_video5.mp4',
        title: 'BuildSmart Storage & Grain Facility',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/agri_video6.mp4',
        title: 'BuildSmart Agricultural Campus Planning',
        subtitle: '',
        size: 'small',
        tag: 'Agricultural'
      },
      {
        src: '/videos/commercial_video1.mp4',
        title: 'BuildSmart Office Tower Development',
        subtitle: '',
        size: 'small',
        tag: 'Commercial'
      },
      {
        src: '/videos/commercial_video2.mp4',
        title: 'BuildSmart Retail Space Creation',
        subtitle: '',
        size: 'small',
        tag: 'Commercial'
      },
      {
        src: '/videos/commercial_video3.mp4',
        title: 'BuildSmart Business Complex Design',
        subtitle: '',
        size: 'small',
        tag: 'Commercial'
      },
      {
        src: '/videos/commercial_video4.mp4',
        title: 'BuildSmart Commercial Property Development',
        subtitle: '',
        size: 'small',
        tag: 'Commercial'
      },
      {
        src: '/videos/industrial_video1.mp4',
        title: 'BuildSmart Industrial Facility Development',
        subtitle: '',
        badge: 'New',
        size: 'large',
        tag: 'Industrial'
      },
      {
        src: '/videos/industrial_video2.mp4',
        title: 'BuildSmart Manufacturing Plant Design',
        subtitle: '',
        badge: 'New',
        size: 'large',
        tag: 'Industrial'
      },
      {
        src: '/videos/industrial_video3.mp4',
        title: 'BuildSmart Warehouse Infrastructure',
        subtitle: '',
        badge: 'New',
        size: 'large',
        tag: 'Industrial'
      },
      {
        src: '/videos/industrial_video4.mp4',
        title: 'BuildSmart Industrial Campus Planning',
        subtitle: '',
        badge: 'New',
        size: 'large',
        tag: 'Industrial'
      },
      {
        src: '/videos/industrial_video5.mp4',
        title: 'BuildSmart Production Facility Creation',
        subtitle: '',
        badge: 'New',
        size: 'large',
        tag: 'Industrial'
      }
    ];

    for (const item of defaultVideos) {
      await videosService.create(item);
    }
    console.log(`✅ Seeded ${defaultVideos.length} videos`);
  }

  // Seed Admin User
  const userModel = app.get<Model<any>>(getModelToken(User.name));
  const adminExists = await userModel.findOne({ email: 'admin@PGI Realtors.com' });
  if (!adminExists) {
    await userModel.create({
      email: 'admin@PGI Realtors.com',
      password: 'adminpass',
      name: 'Administrator'
    });
    console.log('✅ Seeded admin user');
  } else {
    console.log('⚡ Admin user already exists');
  }

  await app.close();
  console.log('⚡ Seeding script completed');
}
bootstrap();
