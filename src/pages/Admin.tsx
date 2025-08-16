import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Package, Users, BarChart3, ArrowLeft, Edit, Trash2, Check, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PaymentLinkDialog } from "@/components/PaymentLinkDialog";

interface StickerPack {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_featured: boolean;
  is_new: boolean;
  payment_link: string | null;
  sticker_files_url: string | null;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  admin_approved: boolean;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    pack_id: string;
    sticker_pack_name: string;
    sticker_pack_image_url: string;
  }>;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalPacks: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    orderId: "",
    orderAmount: 0,
    packId: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const loadData = async () => {
    try {
      // Load sticker packs
      const { data: packs, error: packsError } = await supabase
        .from("sticker_packs")
        .select("*")
        .order("created_at", { ascending: false });

      if (packsError) throw packsError;
      setStickerPacks(packs || []);

      // Load orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            pack_id,
            sticker_pack_name,
            sticker_pack_image_url
          )
        `)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Load stats
      const [
        { count: totalPacks },
        { count: totalUsers },
        { count: totalOrders },
        { count: pendingOrders },
      ] = await Promise.all([
        supabase.from("sticker_packs").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("admin_approved", false),
      ]);

      setStats({
        totalPacks: totalPacks || 0,
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePack = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sticker_packs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setStickerPacks(stickerPacks.filter(pack => pack.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Pacote deletado com sucesso",
      });
    } catch (error) {
      console.error("Error deleting pack:", error);
      toast({
        title: "Erro",
        description: "Erro ao deletar pacote",
        variant: "destructive",
      });
    }
  };

  const approveOrder = async (order: Order) => {
    // Get the first pack ID from order items for the payment link
    const firstPackId = order.order_items[0]?.pack_id;
    if (!firstPackId) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o pacote do pedido",
        variant: "destructive",
      });
      return;
    }

    setPaymentDialog({
      open: true,
      orderId: order.id,
      orderAmount: order.total_amount,
      packId: firstPackId,
    });
  };

  const markAsPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (error) throw error;

      loadData();
      
      toast({
        title: "Sucesso",
        description: "Pedido marcado como pago",
      });
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast({
        title: "Erro",
        description: "Erro ao marcar como pago",
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Administração</h1>
          </div>
          <Button onClick={() => navigate("/admin/pack/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pack
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="packs">Packs de Figurinhas</TabsTrigger>
            <TabsTrigger value="orders">
              Pedidos
              {stats.pendingOrders > 0 && (
                <Badge variant="destructive" className="ml-2">{stats.pendingOrders}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Packs</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPacks}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{stats.pendingOrders}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="packs" className="space-y-6">
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : stickerPacks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum pack encontrado</h3>
                    <p className="text-muted-foreground mb-4">Crie seu primeiro pack de figurinhas</p>
                    <Button onClick={() => navigate("/admin/pack/new")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Pack
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stickerPacks.map((pack) => (
                    <Card key={pack.id}>
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                          {pack.image_url ? (
                            <img 
                              src={pack.image_url} 
                              alt={pack.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{pack.name}</h3>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => navigate(`/admin/pack/${pack.id}`)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-destructive"
                                onClick={() => deletePack(pack.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{pack.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">R$ {pack.price.toFixed(2)}</span>
                            <Badge variant="secondary">{pack.category}</Badge>
                          </div>
                          
                          <div className="flex gap-2">
                            {pack.is_featured && <Badge variant="default">Destaque</Badge>}
                            {pack.is_new && <Badge className="bg-accent">Novo</Badge>}
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span>Link Pagamento:</span>
                              {pack.payment_link ? (
                                <Badge variant="outline" className="text-green-600">✓</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">✗</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Arquivos:</span>
                              {pack.sticker_files_url ? (
                                <Badge variant="outline" className="text-green-600">✓</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">✗</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando pedidos...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido encontrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">#{order.id.slice(-8)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name}</div>
                              <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                              <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="text-sm">
                                  {item.sticker_pack_name} (x{item.quantity})
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold">R$ {order.total_amount.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {!order.admin_approved ? (
                                <Badge variant="secondary">Aguardando Aprovação</Badge>
                              ) : order.status === "pending" ? (
                                <Badge variant="default">Aprovado - Aguardando Pagamento</Badge>
                              ) : order.status === "paid" ? (
                                <Badge variant="default" className="bg-green-600">Pago</Badge>
                              ) : (
                                <Badge variant="outline">{order.status}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!order.admin_approved && (
                                <Button 
                                  size="sm" 
                                  onClick={() => approveOrder(order)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                              )}
                              {order.admin_approved && order.status === "pending" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => markAsPaid(order.id)}
                                >
                                  Marcar como Pago
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <PaymentLinkDialog
          open={paymentDialog.open}
          onClose={() => setPaymentDialog({ ...paymentDialog, open: false })}
          orderId={paymentDialog.orderId}
          orderAmount={paymentDialog.orderAmount}
          packId={paymentDialog.packId}
          onSuccess={loadData}
        />
      </div>
    </div>
  );
};

export default Admin;