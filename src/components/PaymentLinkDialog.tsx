import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentLinkDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderAmount: number;
  packId: string;
  onSuccess: () => void;
}

export const PaymentLinkDialog = ({ 
  open, 
  onClose, 
  orderId, 
  orderAmount, 
  packId,
  onSuccess 
}: PaymentLinkDialogProps) => {
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the pack with payment link
      const { error: packError } = await supabase
        .from("sticker_packs")
        .update({ payment_link: paymentLink })
        .eq("id", packId);

      if (packError) throw packError;

      // Approve the order
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          admin_approved: true,
          approved_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      toast({
        title: "Sucesso",
        description: "Pedido aprovado e link de pagamento adicionado!",
      });

      onSuccess();
      onClose();
      setPaymentLink("");
    } catch (error) {
      console.error("Error approving order:", error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-link">Link de Pagamento</Label>
              <Input
                id="payment-link"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://pix.me/link ou link do produto"
                required
              />
              <p className="text-sm text-muted-foreground">
                Link personalizado com o valor R$ {orderAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Aprovando..." : "Aprovar Pedido"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};