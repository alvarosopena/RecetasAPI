//FetchAPI - Promises
function iniciarApp() {

    const resultado = document.querySelector("#resultado");
    const selectCategorias = document.querySelector("#categorias");
    if(selectCategorias){
        selectCategorias.addEventListener("change", seleccionarCategoria); //cuando es un select usamos un change
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector(".favoritos");
    if(favoritosDiv) {
        obtenerFavoritos();
    }
   
    
    const modal = new bootstrap.Modal("#modal", {});
    

    function obtenerCategorias(){
        const URL = "https://www.themealdb.com/api/json/v1/1/categories.php";
        fetch(URL) //hacemos un fetch - llamado a url
            .then( respuesta => { //entonces quiero una respuesta json
                return respuesta.json();
            })
            .then( resultado => { //imprimir los resultados
                mostrarCategorias(resultado.categories)
            })

    }

    function mostrarCategorias( categorias = []){
        categorias.forEach( categoria => {
            const option = document.createElement("OPTION");
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option);

        })
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value;
        const URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}` //url dinamica
        fetch(URL)
            .then ( respuesta => respuesta.json())
            .then ( resultado => mostrarRecetas(resultado.meals))
    }

    function mostrarRecetas( recetas = [] ) {

        limpiarHTML(resultado);

        const heading = document.createElement("H2");
        heading.classList.add ("text-center" , "text-black", "mv-5");
        heading.textContent = recetas.length ? "Resultados" : "No hay resultados";
        resultado.appendChild(heading)
       
        //Iterar en los resultados
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;
            console.log(receta)
            const recetaContenedor = document.createElement("DIV");
            recetaContenedor.classList.add("col-md-4")//bootstraap genera 3 columnas

            const recetaCard = document.createElement("DIV");
            recetaCard.classList.add("card", "mb-4"); 

            const recetaImagen = document.createElement("IMG");
            recetaImagen.classList.add("card-img-top");
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
            recetaImagen.src = strMealThumb ?? receta.img; //si no hay idmeal, strMeal,etc de la api lo sacamos de ls, para la seccion favoritos
            
            const recetaCardBody = document.createElement("DIV");
            recetaCardBody.classList.add("card-body"); 

            const recetaHeading = document.createElement("H3");
            recetaHeading.classList.add("card-title", "mb-3");
            recetaHeading.textContent = strMeal ?? receta.title;

            const recetaButton = document.createElement("BUTTON");
            recetaButton.classList.add("btn", "btn-danger", "w-100");
            recetaButton.textContent = "Ver receta";
           // recetaButton.dataset.bsTarget = "#modal";
           // recetaButton.dataset.bsToggle = "modal";
           recetaButton.onclick = function (){
            
            seleccionarReceta(idMeal ?? receta.id)
           }

            //Inyectar en el codigo HTML
              /*
            .card
                img
                .card-body
                    h3
                    button
            */

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);

        })

    }

    function seleccionarReceta(id){
        const URL = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(URL)
            .then(respuesta=>respuesta.json())
            .then(resultado =>mostrarRecetaModal(resultado.meals[0]))
        console.log(URL)
    }
    
    //y agregar a ls
    function mostrarRecetaModal(receta){
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
        

        //añadir contenido al modal
        const modalTitle = document.querySelector(".modal .modal-title");
        const modalBody = document.querySelector(".modal .modal-body");

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal} />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `;

        const listGroup = document.createElement("UL")
        listGroup.classList.add=("list-group");

        //Mostrar cantidades e ingredientes
        for( let i = 1; i<=20; i++){
            //si hay ingrediente
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                
                const ingredienteLi = document.createElement("LI");
                ingredienteLi.classList.add("list-group-item");
                ingredienteLi.textContent =      `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi);
                modalBody.appendChild(listGroup)

                const modalFooter = document.querySelector(".modal-footer");
                limpiarHTML(modalFooter);

                //Botones de cerrar y favorito
                const btnFav = document.createElement("BUTTON");
                btnFav.classList.add("btn", "btn-danger","col");
                btnFav.textContent = existeStorage(idMeal) ? "Eliminar Favorito" : "Guardar Favorito";

                //LocalStorage
                btnFav.onclick = function () {
                   if(existeStorage(idMeal)){
                    eliminarFavorito(idMeal);
                    btnFav.textContent = "Guardar Favorito"
                    mostrarToast("Eliminado Correctamente");
                    return //si existe ese id en favorito no se ejecuta agregarFavorito
                   }

                    agregarFavorito({
                        id: idMeal,
                        title: strMeal,
                        img: strMealThumb
                    });
                    btnFav.textContent = "Eliminar Favorito";
                    mostrarToast("Agregado a tus favoritos");

                }

                const btnCloseModal = document.createElement("BUTTON");
                btnCloseModal.classList.add("btn", "btn-secondary","col");
                btnCloseModal.textContent = "Cerrar";
                btnCloseModal.onclick = function(){
                    modal.hide();
                }

                modalFooter.appendChild(btnFav);
                modalFooter.appendChild(btnCloseModal);


            };
        }
        
        //Muestra el modal
        modal.show();
    }

    function agregarFavorito(receta) {
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        localStorage.setItem("favoritos", JSON.stringify([...favoritos, receta]))
        
    }

    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id) //filter nos permite sacar un elemento de un arreglo que cumpla o no una condicion.Asi traemos todos los diferentes al que estamos sacando 
        localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));

    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? [];
        return favoritos.some(favorito => favorito.id === id); //.some itera sobre los elementos de un array y retorna booleano 

    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector("#toast");
        const toastBody = document.querySelector(".toast-body");
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show()

    }
    
    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) ?? []; //si no existen en LS van a ser un arreglo vacio.
        if(favoritos.length){ //si hay algo en los fav se ejecuta este codigo
            mostrarRecetas(favoritos);

            return
        }

        const noFavoritos = document.createElement("P");
        noFavoritos.textContent = "No hay favoritos, agrega los tuyos!";
        noFavoritos.classList.add("fs-4","text-center", "font-bold", "mt-5");
        favoritosDiv.appendChild(noFavoritos);

    }

    function limpiarHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener("DOMContentLoaded", iniciarApp);