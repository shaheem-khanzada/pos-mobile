import { Model } from '@nozbe/watermelondb';
import { children, date, field, text, json } from '@nozbe/watermelondb/decorators';
import { Media } from '../types';
import { sanitizer } from '../utils';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    variants: { type: 'has_many' as const, foreignKey: 'product_id' },
    order_items: { type: 'has_many' as const, foreignKey: 'product_id' },
  };

  @text('title') title!: string;
  @text('description') description!: string | null;
  @text('barcode') barcode!: string | null;
  @field('inventory') inventory!: number | null;
  @field('enable_variants') enableVariants!: boolean | null;
  @field('price_in_pkr_enabled') priceInPKREnabled!: boolean | null;
  @field('price_in_pkr') priceInPKR!: number | null;
  @text('slug') slug!: string;
  @json('media', sanitizer) media!: Media | null;
  @date('deleted_at') deletedAt!: Date | null;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;

  @children('variants') variants!: any;
  @children('order_items') orderItems!: any;
}
