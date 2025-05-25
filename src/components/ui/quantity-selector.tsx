'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  maxQuantity: number;
  minQuantity?: number;
  className?: string;
}

export function QuantitySelector({ 
  quantity, 
  onQuantityChange, 
  maxQuantity, 
  minQuantity = 1,
  className 
}: QuantitySelectorProps) {
  
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = minQuantity; // Or handle as error
    value = Math.max(minQuantity, Math.min(value, maxQuantity));
    onQuantityChange(value);
  };

  return (
    <div className={`flex items-center border rounded-md overflow-hidden ${className}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-full rounded-none border-r"
        onClick={handleDecrement} 
        disabled={quantity <= minQuantity}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleChange}
        className="w-12 h-full text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
        aria-label="Current quantity"
        min={minQuantity}
        max={maxQuantity}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-full rounded-none border-l"
        onClick={handleIncrement} 
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
