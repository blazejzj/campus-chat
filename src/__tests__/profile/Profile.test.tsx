import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Profile from "@/features/profile/screens/Profile";

//  Mock the hooks
vi.mock("@/app/hooks/useAuth");
vi.mock("@/app/hooks/useFetch");

import { useAuth } from "@/app/hooks/useAuth";
import { useFetch } from "@/app/hooks/useFetch";

// Cast mocks
const mockUseAuth = vi.mocked(useAuth);
const mockUseFetch = vi.mocked(useFetch);

// Mock tada..
const mockUser = {
    id: 123,
    email: "testuser@test.com",
    displayName: "Test User",
};

const mockProfile = {
    email: "testuser@test.com",
    displayName: "Test User",
    status: "Available",
    avatarUrl: "",
    notificationsEnabled: true,
};

describe("Profile Screen", () => {
    let mockRequest: any;
    let mockUpdateUser: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = vi.fn();
        mockUpdateUser = vi.fn();

        mockUseFetch.mockReturnValue({
            request: mockRequest,
            loading: false,
            error: "",
            setError: vi.fn(),
        });

        mockUseAuth.mockReturnValue({
            user: mockUser,
            updateUser: mockUpdateUser,
            login: vi.fn(),
            logout: vi.fn(),
        });
    });

    it("should show login message when user is not authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            updateUser: mockUpdateUser,
            login: vi.fn(),
            logout: vi.fn(),
        });

        // act
        render(<Profile />);

        // Assert
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
        expect(
            screen.getByText(
                /you need an account to access your profile settings/i
            )
        ).toBeInTheDocument();
    });

    it("should render profile settings header when user is authenticated", () => {
        // arrange: Mock successful profile load
        mockRequest.mockResolvedValue(mockProfile);

        // act
        render(<Profile />);

        // Assert
        expect(
            screen.getByRole("heading", { name: /profile settings/i })
        ).toBeInTheDocument();
    });

    it("should display profile picture section", () => {
        // arrange
        mockRequest.mockResolvedValue(mockProfile);

        // act
        render(<Profile />);

        // Assert
        expect(
            screen.getByRole("heading", { name: /profile picture/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /a clear photo makes it easier for others to recognize you/i
            )
        ).toBeInTheDocument();
    });

    it("should display notifications section", () => {
        // arrange
        mockRequest.mockResolvedValue(mockProfile);

        // act
        render(<Profile />);

        // Assert
        expect(
            screen.getByRole("heading", { name: /notifications/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/control when we bother you/i)
        ).toBeInTheDocument();
    });

    it("should display password section", () => {
        // arrange
        mockRequest.mockResolvedValue(mockProfile);

        // act
        render(<Profile />);

        // Assert
        expect(
            screen.getByRole("heading", { name: /password/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/keep your account secure/i)
        ).toBeInTheDocument();
    });
});
