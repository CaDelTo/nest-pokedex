import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}
  

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

    return pokemon;

    }catch (error) {
      this.handleExcepctions(error);
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    //Por id
    if (isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase() });
    }
    //Por nombre
    if ( !pokemon && !isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }  
    //Por MongoId
    if ( !pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);

    }
    

    if (!pokemon) {
      throw new NotFoundException(`Pokemon not found`);
    }


    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try{
      const pokemon = await this.findOne(term);
      if ( updatePokemonDto.name )
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
  
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    }catch (error){
      this.handleExcepctions(error);
    }
    
  }

  async remove(id: string) {
    // //const pokemon = await this.findOne(id);
    // //await pokemon.deleteOne();

    //return {id};

    const { deletedCount }= await this.pokemonModel.deleteOne({_id: id});
    
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon not found`);
    }
    return;
  }


  private handleExcepctions( error: any){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Cant create pokemon - Check the logs`);
  }
}
