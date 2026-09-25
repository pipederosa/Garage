"use client";

import { useAutoActivo } from "@/context/AutoContext";
import { useSheetData } from "./useSheetData";

/** Carga los 4 módulos del auto activo (usado por el Dashboard y Service). */
export function useDatosAuto() {
  const { autoActivo } = useAutoActivo();
  const id = autoActivo?.id_auto;
  const nafta = useSheetData("nafta", id);
  const service = useSheetData("service", id);
  const mecanico = useSheetData("mecanico", id);
  const otros = useSheetData("otros", id);

  return {
    auto: autoActivo,
    nafta: nafta.data,
    service: service.data,
    mecanico: mecanico.data,
    otros: otros.data,
    loading: nafta.loading || service.loading || mecanico.loading || otros.loading,
    error: nafta.error || service.error || mecanico.error || otros.error,
    reload: {
      nafta: nafta.reload,
      service: service.reload,
      mecanico: mecanico.reload,
      otros: otros.reload,
    },
  };
}
