"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    //when the order has been created but the ticket it's trying to order hasn't
    //been reserved
    OrderStatus["Created"] = "created";
    //the ticket the order is trying to reserve has already been reserved or when the user
    //has cancelled the order or when the order has expired before payment was received
    OrderStatus["Cancelled"] = "cancelled";
    //the order has successfully reserved the ticket
    OrderStatus["AwaitingPayment"] = "awaiting:payment";
    //the order has reserved the ticket and user has successfully paid
    OrderStatus["Complete"] = "complete";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
