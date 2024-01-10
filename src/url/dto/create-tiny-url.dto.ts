import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTinyUrlDto {
    @IsString()
    @IsNotEmpty()
    url: string;
}
