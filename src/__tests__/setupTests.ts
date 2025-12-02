import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { expect, afterEach, vi } from "vitest";

vi.mock("rwsdk/client", () => ({
    initClient: vi.fn(),
    initClientNavigation: vi.fn(() => ({ handleResponse: vi.fn() })),
    fetchTransport: vi.fn(),
    navigate: vi.fn(),
}));

afterEach(() => {
    cleanup();
});
