import { useMutation } from "@tanstack/react-query";
import { postPayfortPayment, type FlightPayment } from "../services/api/payment";

export function usePayfortPayment() {
    return useMutation({
        mutationFn: (body: FlightPayment) => postPayfortPayment(body),
    });
}
