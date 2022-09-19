import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    orderId: {
      type: String
    }
  },
  // Sets how ticket Document will be viewed as JSON when created
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

//set version key from the default '__v' to 'version'
ticketSchema.set('versionKey', 'version');
//use external plugin to help update version key for optimistic concurrency control
ticketSchema.plugin(updateIfCurrentPlugin);

////method to create a new Doc
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

//create an Ticket model named Ticket with structure defined by ticketSchema
//it also asks mongoose to respect the TicketDoc and TicketModel interface we
//defined for mongo Doc and Model object respectively
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
