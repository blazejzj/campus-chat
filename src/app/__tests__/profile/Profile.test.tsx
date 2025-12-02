import { render, screen } from "@testing-library/react";
import Profile from "@/features/profile/screens/Profile";
import { vi, describe, it, expect, beforeEach } from "vitest";

// mock hooks
vi.mock("@/app/hooks/useAuth");
vi.mock("@/app/hooks/useFetch");

import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";

// cast mocks
const mockUseAuth = vi.mocked(useAuth);
const mockUseFetch = vi.mocked(useFetch);

// mock data
const mockUser = {
    id: 123,
    email: "testuser@test.com",
};

const;
