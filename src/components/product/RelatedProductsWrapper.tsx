import React from "react";
import Product from "@/models/Product";
import { RelatedProducts } from "./RelatedProducts";
import mongoose from "mongoose";

interface RelatedProductsWrapperProps {
  collections: any[];
  excludeId: string;
}

export async function RelatedProductsWrapper({ collections, excludeId }: RelatedProductsWrapperProps) {
  const relatedProductsRaw = await Product.find({
    collections: { $in: collections },
    _id: { $ne: new mongoose.Types.ObjectId(excludeId) }
  }).limit(4).lean();

  const relatedProductsData = JSON.parse(JSON.stringify(relatedProductsRaw));

  return <RelatedProducts products={relatedProductsData} />;
}
