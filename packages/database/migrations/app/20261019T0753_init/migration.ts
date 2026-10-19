#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c4e663769e0f5431c064193887834c9f117d53ccc42a6e9db9d7f316ec4752d0/contract';
import endContract from '../../snapshots/c4e663769e0f5431c064193887834c9f117d53ccc42a6e9db9d7f316ec4752d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Character',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('imagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Level',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('imagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('number', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Target',
        columns: [
          col('characterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('levelId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('x', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('y', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Character',
        constraint: 'Character_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Level',
        constraint: 'Level_number_key',
        columns: ['number'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Target',
        constraint: 'Target_levelId_characterId_key',
        columns: ['levelId', 'characterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Target',
        index: 'Target_characterId_idx_2423fe9d',
        columns: ['characterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Target',
        index: 'Target_levelId_idx_622a0732',
        columns: ['levelId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Target',
        foreignKey: {
          name: 'Target_levelId_fkey',
          columns: ['levelId'],
          references: { schema: 'public', table: 'Level', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Target',
        foreignKey: {
          name: 'Target_characterId_fkey',
          columns: ['characterId'],
          references: { schema: 'public', table: 'Character', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
