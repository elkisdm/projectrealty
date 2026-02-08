import { render, screen } from "@testing-library/react";
import { CardFavoriteButton } from "../parts/CardFavoriteButton";

describe("CardFavoriteButton", () => {
  it("renders without crashing", () => {
    render(
      <CardFavoriteButton unitId="unit-1" isFavorited={false} onToggle={() => {}} />
    );
    const button = screen.getByRole("button", { name: /agregar a favoritos/i });
    expect(button).toBeTruthy();
  });
});
