import { accounting } from "./accounting";
import { music } from "./music";
import { ecommerce } from "./ecommerce";
import { datawarehouse } from "./datawarehouse";

export type DbColumnAttributeType = "PK" | "FK";

export interface DbColumnAttributeRef {
  table: DbTable["name"];
  column: DbColumn["name"];
}

export interface DbColumnAttribute {
  type: DbColumnAttributeType;
  reference?: DbColumnAttributeRef;
}

export interface DbColumn {
  name: string;
  attributes: DbColumnAttribute[];
}

export interface DbTable {
  name: string;
  columns: DbColumn[];
}

export interface Database {
  name: string;
  initSql?: string;
}

export type DatabaseId = "accounting" | "music" | "ecommerce" | "datawarehouse";
export const databases: { [_ in DatabaseId]: Database } = {
  accounting,
  music,
  ecommerce,
  datawarehouse,
};

