"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Send, ShieldCheck, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { ImgBBUploader } from "@/components/admin/products/ImgBBUploader";
import { cn } from "@/lib/utils";

interface ProductReviewFormProps {
  productId: string;
  productName: string;
  onSuccess?: () => void;
}

export function ProductReviewForm({ productId, productName, onSuccess }: ProductReviewFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    images: [] as string[],
    captchaAnswer: ""
  });

  const [captcha, setCaptcha] = useState<{ captcha: string; token: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/auth/me");
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
    fetchCaptcha();

    const saved = localStorage.getItem(`pendingReview_${productId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        localStorage.removeItem(`pendingReview_${productId}`);
      } catch (e) { }
    }
  }, [productId]);

  const fetchCaptcha = async () => {
    try {
      const { data } = await axios.get("/captcha");
      setCaptcha(data);
    } catch (e) {
      toast.error("Failed to load security challenge");
    }
  };

  const handleSignIn = () => {
    localStorage.setItem(`pendingReview_${productId}`, JSON.stringify({
      rating: formData.rating,
      comment: formData.comment,
      images: formData.images
    }));
    router.push(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleSignIn();
      return;
    }

    if (!formData.comment.trim()) {
      toast.error("Please share your experience in the comment.");
      return;
    }

    if (!captcha || !formData.captchaAnswer) {
      toast.error("Please solve the security challenge.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/reviews", {
        product: productId,
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images,
        captchaToken: captcha.token,
        captchaAnswer: formData.captchaAnswer
      });

      toast.success("Review submitted! It will appear once approved.");
      setFormData({ rating: 5, comment: "", images: [], captchaAnswer: "" });
      fetchCaptcha();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit review");
      fetchCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center p-12 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-bprimary/20" />
      </div>
    );
  }

  return (
    <div className="bg-background p-5 sm:p-8 md:p-10 space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-2xl font-heading font-medium text-foreground">
          Review <span className="text-bprimary">Product</span>
        </h3>
        <p className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Experience with {productName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Rating */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</label>
          <div className="flex items-center gap-1.5 bg-muted/30 p-2.5 sm:p-3 rounded-xl w-fit border border-border/50">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className="transition-all hover:scale-110 focus:outline-none"
              >
                <Star
                  className={cn("w-5 h-5 sm:w-6 h-6 transition-colors", star <= formData.rating ? "fill-bprimary text-bprimary" : "text-muted/20")}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Thoughts</label>
          <Textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="What did you think of this fragrance?"
            className="bg-muted/30 border-border/50 rounded-xl min-h-[100px] p-4 text-sm focus:border-bprimary/30 transition-all placeholder:text-muted-foreground/50 resize-none"
          />
        </div>

        {/* Images */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Images</label>
          <div className="flex gap-3 flex-wrap">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.images.length < 3 && (
              <div className="w-16 h-16 bg-muted/30 border border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors group relative overflow-hidden">
                <ImgBBUploader
                  value=""
                  onChange={(url) => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
                  mini
                />
              </div>
            )}
          </div>
        </div>

        {/* Security Challenge */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-bprimary" />
            Verification
          </label>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 w-fit">
            {captcha ? (
              <>
                <img src={captcha.captcha} alt="Captcha" className="h-6 opacity-60 grayscale invert" />
                <Input
                  value={formData.captchaAnswer}
                  onChange={(e) => setFormData(prev => ({ ...prev, captchaAnswer: e.target.value }))}
                  placeholder="Answer"
                  className="w-16 bg-background/50 border-border/50 rounded-lg h-8 text-center font-bold text-bprimary text-[10px]"
                  type="number"
                />
              </>
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="pt-1.5">
          {isLoggedIn ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 sm:h-12 bg-bprimary text-white hover:bg-bprimary-dark hover:scale-[1.01] transition-all rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin " /> : "Post Review"}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3.5 p-4 rounded-xl bg-muted/30 border border-dashed border-border/50 text-center">
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">Please sign in to share your experience.</p>
              <Button
                type="button"
                onClick={handleSignIn}
                variant="outline"
                className="h-9 sm:h-10 px-5 border-bprimary text-bprimary hover:bg-bprimary hover:text-white transition-all rounded-lg font-bold uppercase tracking-widest text-[9px] sm:text-[10px]"
              >
                Sign in
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
