import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqWithUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user_id = request.user.id;
    const result = { ...request.body, user_id };
    return result;
  },
);
