import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { StickerFilesUpload } from "@/components/StickerFilesUpload";

const AdminPackForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    quantity: "1",
    sticker_files_url: "",
    is_featured: false,
    is_new: false,
  });

  const categories = [
    "Emojis",
    "Animais", 
    "Memes",
    "Amor",
    "Comida",
    "Esportes",
    "Trabalho",
    "Família",
    "Humor",
    "Motivação"
  ];

  useEffect(() => {
    checkAdminAccess();
    if (id) {
      loadPack();
    }
  }, [id, user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      navigate("/");
      return;
    }
  };

  const loadPack = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('sticker_packs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Pack não encontrado",
        variant: "destructive",
      });
      navigate("/admin");
      return;
    }

    setFormData({
      name: data.name,
      description: data.description || "",
      price: data.price.toString(),
      category: data.category,
      image_url: data.image_url || "",
      quantity: data.quantity?.toString() || "1",
      sticker_files_url: data.sticker_files_url || "",
      is_featured: data.is_featured,
      is_new: data.is_new,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        quantity: parseInt(formData.quantity),
        sticker_files_url: formData.sticker_files_url || null,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        created_by: user?.id,
      };

      let error;
      if (id) {
        // Update existing pack
        const result = await supabase
          .from('sticker_packs')
          .update(packData)
          .eq('id', id);
        error = result.error;
      } else {
        // Create new pack
        const result = await supabase
          .from('sticker_packs')
          .insert(packData);
        error = result.error;
      }

      if (error) {
        throw error;
      }

      toast({
        title: id ? "Pack atualizado" : "Pack criado",
        description: id ? "Pack atualizado com sucesso" : "Novo pack criado com sucesso",
      });

      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar pack",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Editar Pack" : "Novo Pack de Figurinhas"}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Informações do Pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Pack</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Pack Emojis Clássicos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva o conteúdo do pack..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="9.99"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade de Figurinhas</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ImageUpload 
                  onImageUpload={(url) => setFormData({...formData, image_url: url})}
                  currentImage={formData.image_url}
                  folder="pack-images"
                />

                <StickerFilesUpload 
                  onFilesUpload={(url) => setFormData({...formData, sticker_files_url: url})}
                  currentFiles={formData.sticker_files_url}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_featured" className="text-sm font-medium">
                        Pack em Destaque
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Aparecerá na seção de destaques
                      </p>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_new" className="text-sm font-medium">
                        Pack Novo
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrará a etiqueta "Novo"
                      </p>
                    </div>
                    <Switch
                      id="is_new"
                      checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData({...formData, is_new: checked})}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/admin")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Salvando..." : (id ? "Atualizar Pack" : "Criar Pack")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPackForm;