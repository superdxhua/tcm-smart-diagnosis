import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common'
import { PrescriptionAdjustmentsService } from './prescription-adjustments.service'

@Controller('prescription-adjustments')
export class PrescriptionAdjustmentsController {
  constructor(private readonly prescriptionAdjustmentsService: PrescriptionAdjustmentsService) {}

  @Get()
  async findAll() {
    return {
      code: 200,
      msg: 'success',
      data: await this.prescriptionAdjustmentsService.findAll()
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const adjustment = await this.prescriptionAdjustmentsService.findOne(id)
    if (!adjustment) {
      throw new NotFoundException('处方调整记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: adjustment
    }
  }

  @Post()
  async create(@Body() body: any) {
    return {
      code: 200,
      msg: 'success',
      data: await this.prescriptionAdjustmentsService.create(body)
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const adjustment = await this.prescriptionAdjustmentsService.update(id, body)
    if (!adjustment) {
      throw new NotFoundException('处方调整记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: adjustment
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.prescriptionAdjustmentsService.remove(id)
    if (!result) {
      throw new NotFoundException('处方调整记录不存在')
    }
    return {
      code: 200,
      msg: 'success',
      data: result
    }
  }
}
