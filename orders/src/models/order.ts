import mongoose from 'mongoose';
import { OrderStatus } from '@afang324/common';
import { TicketDoc } from './ticket';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  version: number;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

//method to create a new Doc
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

//set version key from the default '__v' to 'version'
orderSchema.set('versionKey', 'version');
//use external plugin to help update version key for optimistic concurrency control
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
