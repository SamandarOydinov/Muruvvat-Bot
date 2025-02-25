import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Sabrli } from './sabrli.model';

interface ISahiyCreationAttr {
  user_id: number | undefined;
  user_name: string | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  lang: string | undefined;
}

@Table({ tableName: 'sahiy' })
export class Sahiy extends Model<Sahiy, ISahiyCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    unique: true,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
  })
  first_name: string;

  @Column({
    type: DataType.STRING,
  })
  last_name: string;

  @Column({
    type: DataType.STRING,
  })
  user_name: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.JSON,
  })
  description_about_mahsulot: {data: Date, description: string};

  @Column({
    type: DataType.BOOLEAN,
  })
  call_with_admin: boolean;

  @Column({
    type: DataType.JSON,
  })
  location: object;

  @Column({
    type: DataType.STRING,
  })
  lang: string;

  @Column({
    type: DataType.STRING,
  })
  last_state: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  status: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  is_ehson: boolean
}
