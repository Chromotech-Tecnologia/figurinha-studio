import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CreditCard, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import InputMask from "react-input-mask";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [needsAccount, setNeedsAccount] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/");
      return;
    }

    if (user) {
      setCustomerInfo({
        name: "",
        email: user.email || "",
        phone: "",
        password: "",
      });
    }
  }, [user, items.length, navigate]);

  const handleAccountCheck = async () => {
    if (!customerInfo.email) return;
    
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setNeedsAccount(true);
    }
  };

  const handleCreateAccountAndOrder = async () => {
    setLoading(true);
    try {
      let currentUser = user;
      
      if (!user) {
        if (hasAccount) {
          // User says they have account, try to sign in
          const { error: signInError } = await signIn(customerInfo.email, customerInfo.password);
          if (signInError) {
            toast({
              title: "Erro no login",
              description: "Email ou senha incorretos. Tente novamente.",
              variant: "destructive",
            });
            return;
          }
          // Get the user after sign in
          const { data } = await supabase.auth.getUser();
          currentUser = data.user;
        } else {
          // Create new account
          const { error: signUpError } = await signUp(customerInfo.email, customerInfo.password, customerInfo.name);
          if (signUpError) {
            toast({
              title: "Erro no cadastro",
              description: signUpError.message,
              variant: "destructive",
            });
            return;
          }
          // Get the user after sign up
          const { data } = await supabase.auth.getUser();
          currentUser = data.user;
        }
      }

      if (!currentUser) {
        throw new Error("Erro ao autenticar usuário");
      }

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: currentUser.id,
          total_amount: totalPrice,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          status: "pending",
          admin_approved: false
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        pack_id: item.pack_id,
        quantity: item.quantity,
        price: item.price,
        sticker_pack_name: item.name,
        sticker_pack_image_url: item.image_url
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;
      
      await clearCart();
      
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Aguarde a aprovação do administrador para prosseguir com o pagamento.",
      });
      
      navigate("/my-orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro no pedido",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      await handleAccountCheck();
      return;
    }
    
    await handleCreateAccountAndOrder();
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Finalizar Compra</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.pack_id} className="flex items-center space-x-3">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                  </div>
                  <p className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {user ? "Informações do Cliente" : "Dados para Compra"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user && needsAccount && (
                <Alert className="mb-4">
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>Para finalizar sua compra, você precisa ter uma conta.</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setHasAccount(true)}
                        >
                          Já tenho conta
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setHasAccount(false)}
                        >
                          Criar nova conta
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    required
                    disabled={!!user}
                  />
                </div>
                
                {!user && needsAccount && (
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {hasAccount ? "Senha" : "Criar Senha"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={customerInfo.password}
                      onChange={(e) => setCustomerInfo({...customerInfo, password: e.target.value})}
                      placeholder={hasAccount ? "Digite sua senha" : "Mínimo 6 caracteres"}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Método de Pagamento
                  </h3>
                   <p className="text-sm text-muted-foreground">
                     As figurinhas serão enviadas para o WhatsApp cadastrado após confirmação do pagamento.
                   </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Processando..." : 
                   !user && needsAccount ? (hasAccount ? "Fazer Login e Finalizar" : "Criar Conta e Finalizar") :
                   `Finalizar Pedido R$ ${totalPrice.toFixed(2)}`}
                </Button>

                {!user && !needsAccount && (
                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => navigate("/auth")}
                    >
                      Já tem uma conta? Faça login
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;