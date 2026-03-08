import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("renders store heading", () => {
  render(<App />);
  const heading = screen.getByText(/E-Commerce Store/i);
  expect(heading).toBeInTheDocument();
});

test("renders products section", () => {
  render(<App />);
  const productsHeading = screen.getByText(/Products/i);
  expect(productsHeading).toBeInTheDocument();
});
