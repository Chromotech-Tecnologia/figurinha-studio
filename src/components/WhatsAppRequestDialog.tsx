import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputMask from "react-input-mask";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppRequestDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  defaultPhone?: string;
  onSuccess?: (phone: string) => void;
}

export const WhatsAppRequestDialog = ({ open, onClose, orderId, defaultPhone = "", onSuccess }: WhatsAppRequestDialogProps) => {
  const { toast } = useToast();
  const [phone, setPhone] = useState(defaultPhone);
  const [confirmPhone, setConfirmPhone] = useState(defaultPhone);
  const [submitting, setSubmitting] = useState(false);

  const sanitize = (value: string) => value.replace(/\D/g, "");

  const handleSubmit = async () => {
    if (!orderId) return;
    const p = sanitize(phone);
    const c = sanitize(confirmPhone);
    if (!p || p !== c || p.length < 10) {
      toast({
        title: "Dados inválidos",
        description: "Verifique o telefone e a confirmação.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("request_order_whatsapp", {
        p_order_id: orderId,
        p_whatsapp_number: p,
      });
      if (error) throw error;
      toast({ title: "Solicitação registrada", description: "Vamos enviar suas figurinhas pelo WhatsApp." });
      onSuccess?.(p);
      onClose();
    } catch (err: any) {
      console.error("request whatsapp error", err);
      toast({ title: "Erro", description: err?.message || "Não foi possível enviar a solicitação.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar pelo WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Telefone (WhatsApp)</Label>
            <InputMask mask="(99) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}>
              {(inputProps: any) => <Input {...inputProps} placeholder="(11) 99999-9999" />}
            </InputMask>
          </div>
          <div className="space-y-2">
            <Label>Confirme o Telefone</Label>
            <InputMask mask="(99) 99999-9999" value={confirmPhone} onChange={(e) => setConfirmPhone(e.target.value)}>
              {(inputProps: any) => <Input {...inputProps} placeholder="(11) 99999-9999" />}
            </InputMask>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Enviando..." : "Confirmar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
