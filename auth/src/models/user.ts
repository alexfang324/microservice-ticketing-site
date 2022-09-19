import mongoose from 'mongoose';
import { PasswordManager } from '../services/password-manager';

//An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

//An interface that describes the properties that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

//An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  // Sets how user Document will be viewed as JSON when created
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      }
    }
  }
);

//define a "build" method that takes a well defined (by UserAttrs interface)
//input and create a new User Doc with it.
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

//Hash password before inserting(i.e.save) user Doc to db
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await PasswordManager.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

//create an User model named User with structure defined by userSchema
//it also asks mongoose to respect the UserDoc and UserModel interface we
//defined for mongo Doc and Model object respectively
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
