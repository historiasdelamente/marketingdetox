"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIAS = [
  { name: "APEGO", count: 12, description: "Teoría del apego, estilos, trauma" },
  { name: "LA NIÑA INTERIOR", count: 16, description: "Fundamentos, heridas, reparentalización" },
  { name: "NARCICISMO", count: 9, description: "Perspectivas clínicas, tipos, relaciones" },
  { name: "RECUPERACIÓN DESPUÉS DEL ABUSO", count: 4, description: "Identidad, autoestima, relaciones sanas" },
  { name: "talleres_apego", count: 5, description: "Talleres prediseñados sobre apego" },
  { name: "tono-emocional", count: 3, description: "Guías de tono y estilo" },
];

export default function ConocimientoPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/conocimiento/sync", { method: "POST" });
      const data = await res.json();
      setSyncResult(
        `Sincronización completada: ${data.added || 0} nuevos, ${data.updated || 0} actualizados, ${data.unchanged || 0} sin cambios`
      );
    } catch {
      setSyncResult("Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Base de Conocimiento</h1>
          <p className="text-sm text-muted-foreground">
            47 PDFs clínicos en 6 categorías - Fuente de verdad para todos los agentes
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>

      {syncResult && (
        <div className="mb-4 rounded-md bg-primary/10 p-3 text-sm text-primary">
          {syncResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATEGORIAS.map((cat) => (
          <Card key={cat.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cat.name}</CardTitle>
                <Badge variant="secondary">{cat.count} docs</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
