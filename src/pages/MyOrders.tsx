import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ExternalLink, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppRequestDialog } from "@/components/WhatsAppRequestDialog";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  admin_approved: boolean;
  created_at: string;
  customer_name: string;
  customer_phone?: string;
  whatsapp_requested?: boolean;
  whatsapp_number?: string | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    sticker_pack_name: string;
    sticker_pack_image_url: string;
    pack_id: string;
  }>;
}

interface StickerPack {
  id: string;
  payment_link: string | null;
  sticker_files_url: string | null;
}

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stickerPacks, setStickerPacks] = useState<Record<string, StickerPack>>({});
const [loading, setLoading] = useState(true);
  const [waDialog, setWaDialog] = useState<{open: boolean; orderId: string | null; phone: string}>({ open: false, orderId: null, phone: "" });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          admin_approved,
          created_at,
          customer_name,
          customer_phone,
          whatsapp_requested,
          whatsapp_number,
          order_items (
            id,
            quantity,
            price,
            sticker_pack_name,
            sticker_pack_image_url,
            pack_id
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Load sticker pack details for payment links
      const packIds = Array.from(new Set(
        ordersData?.flatMap(order => 
          order.order_items.map(item => item.pack_id)
        ).filter(Boolean) || []
      ));

      if (packIds.length > 0) {
        const { data: packsData, error: packsError } = await supabase
          .from("sticker_packs")
          .select("id, payment_link, sticker_files_url")
          .in("id", packIds);

        if (packsError) throw packsError;

        const packsMap = packsData?.reduce((acc, pack) => {
          acc[pack.id] = pack;
          return acc;
        }, {} as Record<string, StickerPack>) || {};

        setStickerPacks(packsMap);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, adminApproved: boolean) => {
    if (status === "pending" && !adminApproved) {
      return <Badge variant="secondary">Aguardando Aprovação</Badge>;
    }
    if (status === "pending" && adminApproved) {
      return <Badge variant="default">Aprovado - Aguardando Pagamento</Badge>;
    }
    if (status === "paid") {
      return <Badge variant="default" className="bg-green-600">Pago</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handlePayment = (paymentLink: string) => {
    window.open(paymentLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Explorar Pacotes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status, order.admin_approved)}
                      <p className="text-lg font-bold mt-1">
                        R$ {order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.sticker_pack_image_url} 
                            alt={item.sticker_pack_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{item.sticker_pack_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                          
                          {/* Show payment button if approved but not paid */}
                          {order.admin_approved && order.status === "pending" && 
                           stickerPacks[item.pack_id]?.payment_link && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePayment(stickerPacks[item.pack_id].payment_link!)}
                              className="ml-2"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          
                          {/* Actions when paid */}
                          {order.status === "paid" && (
                            <>
                              {stickerPacks[item.pack_id]?.sticker_files_url && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownload(stickerPacks[item.pack_id].sticker_files_url!)}
                                  className="ml-2"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => setWaDialog({ open: true, orderId: order.id, phone: order.whatsapp_number || order.customer_phone || "" })}
                                className="ml-2"
                                variant={order.whatsapp_requested ? "secondary" : "default"}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {order.whatsapp_requested ? "Solicitado via WhatsApp" : "Me envie pelo WhatsApp"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
        <WhatsAppRequestDialog
          open={waDialog.open}
          orderId={waDialog.orderId}
          defaultPhone={waDialog.phone}
          onClose={() => setWaDialog({ open: false, orderId: null, phone: "" })}
          onSuccess={(phone) => {
            setOrders((prev) => prev.map(o => o.id === waDialog.orderId ? { ...o, whatsapp_requested: true, whatsapp_number: phone } : o));
          }}
        />
      </div>
    </div>
  );
};

export default MyOrders;