import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
var data = require('../package.json')
async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = PORT || 3001;
  const options = new DocumentBuilder()
    .setTitle('SCNO API by l1ttps')
    .setVersion(data.version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  await app.listen(port);
}
bootstrap();
