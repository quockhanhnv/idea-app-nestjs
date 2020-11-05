import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {

    // custome
    if(value instanceof Object && this.isEmpty(value)) {
        throw new HttpException('Validation failed: No body submitted', HttpStatus.BAD_REQUEST);  
    }


    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException(`Validation failed: ${this.formatErrors(errors)}`);
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  // custom
  private formatErrors(errors: any[]) {
      return errors.map(err => {
          for(let property in err.constrains) {
              return err.constrains[property];
          }
      }).join(', ');
  }
  // custom
  private isEmpty(value: any) {
    if(Object.keys(value).length > 0) {
        return false;
    }

    return true;
  }

}