import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor'
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.setGlobalPrefix('api')

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('RBAC接口文档')
    .setDescription('RBAC接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  const configService = app.get(ConfigService)
  const port = configService.get<number>('RBAC_APP_PORT') || 3000
  await app.listen(port)
}
bootstrap()
