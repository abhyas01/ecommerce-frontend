import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import axios from "axios";

jest.mock("axios");

beforeEach(() => jest.clearAllMocks());

test("renders store heading", () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(<App />);
  expect(screen.getByText(/E-Commerce Store/i)).toBeInTheDocument();
});

test("renders products section heading", () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(<App />);
  expect(screen.getByText(/Products/i)).toBeInTheDocument();
});

test("renders products fetched from API", async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { id: 1, name: "Laptop", price: "999.99" },
      { id: 2, name: "Mouse", price: "29.99" },
    ],
  });
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText("Laptop")).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText("Mouse")).toBeInTheDocument();
  });
});

test("renders Buy Now button for each product", async () => {
  axios.get.mockResolvedValueOnce({
    data: [{ id: 1, name: "Keyboard", price: "79.99" }],
  });
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText("Buy Now")).toBeInTheDocument();
  });
});

test("shows no products when API returns empty array", async () => {
  axios.get.mockResolvedValueOnce({ data: [] });
  render(<App />);
  await waitFor(() => {
    expect(screen.queryByText("Buy Now")).not.toBeInTheDocument();
  });
});

test("calls order API when Buy Now is clicked", async () => {
  axios.get.mockResolvedValueOnce({
    data: [{ id: 1, name: "Laptop", price: "999.99" }],
  });
  axios.post.mockResolvedValueOnce({
    data: { id: 1, product_id: 1, quantity: 1, status: "pending" },
  });
  window.alert = jest.fn();
  render(<App />);
  await screen.findByText("Buy Now");
  fireEvent.click(screen.getByText("Buy Now"));
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
