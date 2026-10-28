#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7afd646d1e9d775b45e704a448c62da0a38e80bb2d2549f26b3842c32ef4f6ec/contract';
import endContract from '../../snapshots/7afd646d1e9d775b45e704a448c62da0a38e80bb2d2549f26b3842c32ef4f6ec/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c4e663769e0f5431c064193887834c9f117d53ccc42a6e9db9d7f316ec4752d0/contract';
import startContract from '../../snapshots/c4e663769e0f5431c064193887834c9f117d53ccc42a6e9db9d7f316ec4752d0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'Target',
        constraint: 'Target_levelId_characterId_key',
      }),
      this.dropConstraint({
        schema: 'public',
        table: 'Target',
        constraint: 'Target_pkey',
        kind: 'primaryKey',
      }),
      this.dropColumn({ schema: 'public', table: 'Target', column: 'id' }),
      this.createTable({
        schema: 'public',
        table: 'FoundCharacter',
        columns: [
          col('characterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('gameId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['gameId', 'characterId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Game',
        columns: [
          col('elapsedMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('finishedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('levelId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('playerName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addPrimaryKey({
        schema: 'public',
        table: 'Target',
        constraint: 'Target_pkey',
        columns: ['levelId', 'characterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FoundCharacter',
        index: 'FoundCharacter_characterId_idx_2423fe9d',
        columns: ['characterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FoundCharacter',
        index: 'FoundCharacter_gameId_idx_6cdb47f8',
        columns: ['gameId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Game',
        index: 'Game_levelId_elapsedMs_idx_261447d5',
        columns: ['levelId', 'elapsedMs'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Game',
        index: 'Game_levelId_idx_622a0732',
        columns: ['levelId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FoundCharacter',
        foreignKey: {
          name: 'FoundCharacter_gameId_fkey',
          columns: ['gameId'],
          references: { schema: 'public', table: 'Game', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FoundCharacter',
        foreignKey: {
          name: 'FoundCharacter_characterId_fkey',
          columns: ['characterId'],
          references: { schema: 'public', table: 'Character', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Game',
        foreignKey: {
          name: 'Game_levelId_fkey',
          columns: ['levelId'],
          references: { schema: 'public', table: 'Level', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
