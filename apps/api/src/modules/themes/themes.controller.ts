import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ThemesService } from './themes.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('themes')
@Controller({ path: 'themes', version: '1' })
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all theme presets' })
  findAll() {
    return this.themesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get theme preset by ID' })
  findOne(@Param('id') id: string) {
    const theme = this.themesService.findById(id);
    if (!theme) throw new NotFoundException(`Theme "${id}" not found`);
    return theme;
  }
}
