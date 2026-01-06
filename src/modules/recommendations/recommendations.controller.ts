import { Controller, Get, Param, Query, UseGuards, Req} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recs: RecommendationsService) {}

@Get('my')
@UseGuards(FirebaseAuthGuard)
getMine(@Req() req) {
  return this.recs.getRecommendations(req.user.uid, 10);
}

}
