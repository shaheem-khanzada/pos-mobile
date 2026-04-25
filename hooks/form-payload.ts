/**
 * Re-exports payload normalizers for product form wiring.
 * Domain shaping still lives in `@/payload/normalizers`; keep that file the source of truth.
 */
export {
  buildProductFormInitialFromProduct,
  relationId,
  relationIds,
} from '@/payload/normalizers';
