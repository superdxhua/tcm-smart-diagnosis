import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, UseGuards, Request } from '@nestjs/common'
import { MedicationFeedbackService } from './medication-feedback.service'

@Controller('medication-feedback')
export class MedicationFeedbackController {
  constructor(private readonly medicationFeedbackService: MedicationFeedbackService) {}

  @Get()
  async findAll() {
    return {
      code: 200,
      msg: 'success',
      data: await this.medicationFeedbackService.findAll()
    }
  }

  @Get('analyze/:recordId')
  async analyzeFeedback(@Param('recordId') recordId: string) {
    const analysis = await this.medicationFeedbackService.analyzeFeedback(recordId)
    return {
      code: 200,
      msg: 'success',
      data: analysis
    }
  }

  @Get('learning-summary')
  async getLearningSummary() {
    const summary = await this.medicationFeedbackService.getLearningSummary()
    return {
      code: 200,
      msg: 'success',
      data: summary
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const feedback = await this.medicationFeedbackService.findOne(id)
    if (!feedback) {
      throw new NotFoundException('服药反馈记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: feedback
    }
  }

  @Post()
  async create(@Body() body: any) {
    return {
      code: 200,
      msg: 'success',
      data: await this.medicationFeedbackService.create(body)
    }
  }

  @Post('optimize-prescription')
  async optimizePrescription(@Body() body: {
    recordId: string;
    feedbackId: string;
    currentPrescription: string;
    feedbackData: any;
  }) {
    const optimization = await this.medicationFeedbackService.optimizePrescription(body)
    return {
      code: 200,
      msg: 'success',
      data: optimization
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const feedback = await this.medicationFeedbackService.update(id, body)
    if (!feedback) {
      throw new NotFoundException('服药反馈记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: feedback
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.medicationFeedbackService.remove(id)
    if (!result) {
      throw new NotFoundException('服药反馈记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: result
    }
  }
}
