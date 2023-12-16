// const {categories : category} =require('../model/dataBaseModel')
const category = require('../model/categoryModal')


async function loadCategory (req,res){

            try {
              if (req.session.admin) {
                const categories = await category.find().sort({date:-1});
              res.render('category',{categories})
              } else {
                res.redirect('/admin/dashboard')
              }
              
          
            } catch (error) {
            console.log(error.message)
            }
          }


         
async function loadAddCategory (req,res){
        try {
          if (req.session.admin) {
            res.render('addCategory',{message:""})
          } else {
            res.render('category')
          }
        
        } catch (error) {
        console.log(Error.message);
        }
}




async function addCategory(req,res) {
          try {
            
          const { categoryName, description ,discountPercentage } = req.body;
          
          const catName = await  category.findOne({category:categoryName});
          console.log(categoryName);

          if (catName && categoryName === catName.category ) {
             res.render('addCategory',{ message:"You are entered category is already exist" })
          } else {

            const Categories = new category({
              category : categoryName ,
              image :  req.file.filename,
              description : description,
              listed:true,
              discountPercentage:discountPercentage
              });
              console.log(Categories.image);
              await Categories.save();
              res.redirect('/admin/category');
          }

         

          } catch (error) {
          console.log(error.message);
          }
   }




async function listingCategory (req,res){
          try{
          const id = req.query.id;
          if (id) {
          const data = await category.findById(id);
          data.listed = !data.listed;
          await data.save();
          res.redirect('/admin/category');
          } else {
          res.redirect('/admin/category');
          console.log("not changed ");
          }


          }catch(error){
          console.log(error.message);
          }

}


async function loadEditCategory (req,res){

   try {  if (req.session.admin) {
    const id = req.query.id;
    console.log(id);
    const value = await category.findById(id);
    res.render('editCategory',{value});
    
    console.log(value);
   } else {
    res.render('category')
   }
       
   } catch (error) {
    console.log(error.message)
   }
}




async function updateCategory (req,res){
  try {
    
    
    
    const id=req.query.id;
    const name = req.body.categoryname;
    const desc=req.body.description;

    const discountPercentage = req.body.discountPercentage;
   
    
    
    let image = ''; 

    if (req.file && req.file.filename) {
      image = req.file.filename; 
    }

   
    
    if (image ) {
        console.log("111111111111111111");
      const updatedCat = await category.findByIdAndUpdate({_id:id},{category:name,description:desc,discountPercentage:discountPercentage ,image:image},{ new: true });
      
    } else {
      const updatedCat = await category.findByIdAndUpdate({_id:id},{category:name,description:desc ,discountPercentage:discountPercentage },{ new: true });
    }

      res.redirect('/admin/category')

  } catch (error) {
    console.log(error.message);
  }
}



 

module.exports = {
  loadCategory,
  loadAddCategory,
  addCategory,
  listingCategory,
  loadEditCategory,
  updateCategory,
  
}