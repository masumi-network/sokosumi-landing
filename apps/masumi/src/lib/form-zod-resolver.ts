/**
 * Thin wrapper around @hookform/resolvers/zod that suppresses a type-level
 * incompatibility between @hookform/resolvers@5.x and Zod v4.1+.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver as _zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

export function zodResolver<T extends FieldValues>(
  schema: ZodType<T, any, any>,
): Resolver<T> {
  return _zodResolver(schema as any) as Resolver<T>;
}
