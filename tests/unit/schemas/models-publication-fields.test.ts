import { UnitSchema } from "@schemas/models";

describe("UnitSchema publication wizard fields", () => {
  const baseUnit = {
    id: "unit-123",
    slug: "departamento-estudio-providencia-123",
    codigoUnidad: "101",
    buildingId: "building-456",
    tipologia: "Estudio",
    price: 500000,
    disponible: true,
    dormitorios: 1,
    banos: 1,
    garantia: 500000,
  };

  test("acepta campos de wizard de publicación", () => {
    const withPublicationWizard = {
      ...baseUnit,
      operation_type: "rent" as const,
      publication_title: "Departamento en arriendo",
      publication_description: "Excelente conectividad y amenidades",
      unit_amenities: ["Piscina", "Gimnasio"],
      draft_step: 4,
      draft_completed_steps: ["building", "type", "media"],
      draft_last_saved_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };

    expect(() => UnitSchema.parse(withPublicationWizard)).not.toThrow();
  });

  test("rechaza operation_type fuera del alcance MVP", () => {
    expect(() =>
      UnitSchema.parse({
        ...baseUnit,
        operation_type: "sale",
      })
    ).toThrow();
  });
});
