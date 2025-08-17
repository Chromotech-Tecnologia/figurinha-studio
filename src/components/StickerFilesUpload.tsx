import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StickerFilesUploadProps {
  onFilesUpload: (url: string) => void;
  currentFiles?: string;
}

export const StickerFilesUpload = ({ onFilesUpload, currentFiles }: StickerFilesUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFiles = async (file: File) => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sticker-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('sticker-files')
        .getPublicUrl(filePath);

      onFilesUpload(data.publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Arquivo de figurinhas enviado com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFiles(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadFiles(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeFiles = () => {
    onFilesUpload("");
  };

  return (
    <div className="space-y-4">
      <Label>Arquivo das Figurinhas (ZIP)</Label>
      
      {currentFiles ? (
        <div className="relative">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Arquivo carregado</p>
              <p className="text-sm text-muted-foreground">ZIP com as figurinhas</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeFiles}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Arraste um arquivo ZIP aqui ou clique para selecionar
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Enviando..." : "Selecionar Arquivo"}
          </Button>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept=".zip,.rar,.7z"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-sm text-muted-foreground">
        Faça upload de um arquivo ZIP contendo todas as figurinhas do pacote. 
        Este arquivo será disponibilizado para download apenas após o pagamento.
      </p>
    </div>
  );
};