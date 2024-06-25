import { Request } from 'express';

interface Xrequest extends Request {
  accountId?: string; // Add the accountId property
  authToken?: string;
  account?:any;
  payload?:any;
  body:any;
  files?:File[] | any;
  attachments?:any
}

export default Xrequest;
