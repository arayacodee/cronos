import {
  HttpInterceptorFn
} from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  if (request.url.startsWith(environment.apiUrl)) {
    request = request.clone({
      withCredentials: true
    });
  }

  return next(request);
};
