import { FormControl, ValidationErrors } from "@angular/forms";
export class ShopValidators {
    
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors{

        if((control.value != null) && (control.value.trim().length === 0)){
            //invalid --> return true
            return { 'notOnlyWhiteSpace': true};
        }else{
            //pass --> return null
            return null;
        }
        
    }

}
